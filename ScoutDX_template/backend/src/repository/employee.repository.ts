import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

export interface EmployeeRow {
  employee_id: string;
  name: string;
  position_id: number | null;
  position_name: string | null;
  created_at: string | null;
  updated_at: string | null;
}

@Injectable()
export class EmployeeRepository {
  constructor(private readonly dataSource: DataSource) {}

  async createEmployee(
    employeeId: string,
    name: string,
    password: string,
    positionId: number,
  ): Promise<EmployeeRow> {
    await this.dataSource.query(
      `
        INSERT INTO EMPLOYEES (
          employee_id,
          name,
          password,
          position_id,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, NOW(), NOW())
      `,
      [employeeId, name, password, positionId],
    );

    const row = await this.findByEmployeeId(employeeId);
    if (!row) {
      throw new Error("FAILED_TO_CREATE_EMPLOYEE");
    }

    return row;
  }

  async existsByEmployeeId(employeeId: string): Promise<boolean> {
    const rows = await this.dataSource.query(
      `
        SELECT 1
        FROM EMPLOYEES
        WHERE employee_id = $1
        LIMIT 1
      `,
      [employeeId],
    );

    return rows.length > 0;
  }

  async findAll(): Promise<EmployeeRow[]> {
    return this.dataSource.query(`
      SELECT
        e.employee_id,
        e.name,
        e.position_id,
        p.position_name,
        e.created_at,
        e.updated_at
      FROM EMPLOYEES e
      LEFT JOIN POSITIONS p ON p.position_id = e.position_id
      ORDER BY e.employee_id
    `);
  }

  async findByEmployeeId(employeeId: string): Promise<EmployeeRow | null> {
    const rows = await this.dataSource.query(
      `
        SELECT
          e.employee_id,
          e.name,
          e.position_id,
          p.position_name,
          e.created_at,
          e.updated_at
        FROM EMPLOYEES e
        LEFT JOIN POSITIONS p ON p.position_id = e.position_id
        WHERE e.employee_id = $1
        LIMIT 1
      `,
      [employeeId],
    );

    if (!rows.length) {
      return null;
    }

    return rows[0];
  }

  async updatePosition(
    employeeId: string,
    positionId: number | null,
  ): Promise<EmployeeRow | null> {
    const rows = await this.dataSource.query(
      `
        UPDATE EMPLOYEES
        SET position_id = $2,
            updated_at = NOW()
        WHERE employee_id = $1
        RETURNING employee_id
      `,
      [employeeId, positionId],
    );

    if (!rows.length) {
      return null;
    }

    return this.findByEmployeeId(employeeId);
  }

  async resetPasswordToUserName(employeeId: string): Promise<boolean> {
    const rows = await this.dataSource.query(
      `
        UPDATE EMPLOYEES
        SET password = employee_id,
            updated_at = NOW()
        WHERE employee_id = $1
        RETURNING employee_id
      `,
      [employeeId],
    );

    return rows.length > 0;
  }

  async updateEmployeeProfile(
    currentEmployeeId: string,
    nextEmployeeId: string,
    name: string,
    positionId: number,
  ): Promise<EmployeeRow | null> {
    if (currentEmployeeId === nextEmployeeId) {
      const rows = await this.dataSource.query(
        `
          UPDATE EMPLOYEES
          SET employee_id = $2,
              name = $3,
              position_id = $4,
              updated_at = NOW()
          WHERE employee_id = $1
          RETURNING employee_id
        `,
        [currentEmployeeId, nextEmployeeId, name, positionId],
      );

      if (!rows.length) {
        return null;
      }

      return this.findByEmployeeId(nextEmployeeId);
    }

    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();

    try {
      const currentRows = await runner.query(
        `
          SELECT employee_id, password
          FROM EMPLOYEES
          WHERE employee_id = $1
          LIMIT 1
        `,
        [currentEmployeeId],
      );

      if (!currentRows.length) {
        await runner.rollbackTransaction();
        return null;
      }

      const duplicateRows = await runner.query(
        `
          SELECT 1
          FROM EMPLOYEES
          WHERE employee_id = $1
          LIMIT 1
        `,
        [nextEmployeeId],
      );

      if (duplicateRows.length) {
        throw new Error("EMPLOYEE_ID_ALREADY_EXISTS");
      }

      const current = currentRows[0] as { password: string };

      await runner.query(
        `
          INSERT INTO EMPLOYEES (
            employee_id,
            name,
            password,
            position_id,
            created_at,
            updated_at
          )
          VALUES ($1, $2, $3, $4, NOW(), NOW())
        `,
        [nextEmployeeId, name, current.password, positionId],
      );

      await runner.query(
        `
          UPDATE SCOUT_MESSAGES
          SET created_by_employee_id = $2
          WHERE created_by_employee_id = $1
        `,
        [currentEmployeeId, nextEmployeeId],
      );

      await runner.query(
        `
          UPDATE SCOUT_MESSAGES
          SET updated_by_employee_id = $2
          WHERE updated_by_employee_id = $1
        `,
        [currentEmployeeId, nextEmployeeId],
      );

      await runner.query(
        `
          UPDATE SCOUT_MESSAGE_HISTORIES
          SET returned_by_employee_id = $2
          WHERE returned_by_employee_id = $1
        `,
        [currentEmployeeId, nextEmployeeId],
      );

      await runner.query(
        `
          DELETE FROM EMPLOYEES
          WHERE employee_id = $1
        `,
        [currentEmployeeId],
      );

      await runner.commitTransaction();
      return this.findByEmployeeId(nextEmployeeId);
    } catch (error) {
      await runner.rollbackTransaction();
      throw error;
    } finally {
      await runner.release();
    }
  }
}
