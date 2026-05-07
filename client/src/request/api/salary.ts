import request from "../axios";

export interface SalaryRule {
  daily_wage: number;
  overtime_rate: number;
  late_deduct: number;
  absent_deduct: number;
}

export interface SalaryCalcItem {
  name: string;
  work_id: string;
  work_days: number;
  base_salary: number;
  overtime_money: number;
  deduct_money: number;
  real_salary: number;
}

export interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}

export const salaryApi = {
  getRule: () => request.get<ApiResponse<SalaryRule>>("/salary/rule"),
  saveRule: (data: SalaryRule) => request.post("/salary/rule", data),
  calcAll: () => request.get<ApiResponse<SalaryCalcItem[]>>("/salary/calc-all")
};
