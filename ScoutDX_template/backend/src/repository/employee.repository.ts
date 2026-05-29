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
}
