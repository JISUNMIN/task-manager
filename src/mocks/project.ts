"use client";
import { faker } from "@faker-js/faker";

export interface Project {
  name: string;
  manager: string;
  progress: number;
  dueDate: string;
}

class ProjectMock {
  private list: Project[] = [];

  constructor() {
    this.list = this.generateList(10);
  }

  private generateList(count: number): Project[] {
    return Array.from({ length: count }, () => ({
      name: faker.company.name(),
      manager: faker.person.fullName(),
      progress: faker.number.int({ min: 0, max: 100 }),
      dueDate: faker.date.future().toISOString().split("T")[0], // YYYY-MM-DD 형식
    }));
  }

  public getMockData(): Project[] {
    return this.list;
  }

  public generateNewData(count: number): void {
    this.list = this.generateList(count);
  }
}

// ProjectMock 인스턴스 생성 및 getMockData 접근
export const getMockData = new ProjectMock().getMockData.bind(
  new ProjectMock()
);
