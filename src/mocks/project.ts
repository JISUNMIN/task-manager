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
}

export const getMockData = new ProjectMock().getMockData;
