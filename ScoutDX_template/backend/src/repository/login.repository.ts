import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

export interface EmployeeLoginRow {
  employee_id: string;
  name: string;
  position_id: number | null;
}

@Injectable()
export class LoginRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findByEmployeeIdAndPassword(
    employeeId: string,
    password: string,
  ): Promise<EmployeeLoginRow | null> {
    const rows = await this.dataSource.query(
      `
        SELECT employee_id, name, position_id
        FROM EMPLOYEES
        WHERE employee_id = $1 AND password = $2
        LIMIT 1
      `,
      [employeeId, password],
    );

    if (!rows.length) {
      return null;
    }

    return rows[0];
  }
}
