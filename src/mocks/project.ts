"use client";
import { faker } from "@faker-js/faker";

export const mockProjects = Array.from({ length: 10 }, () => ({
  name: faker.company.name(),
  manager: faker.person.fullName(),
  progress: faker.number.int({ min: 0, max: 100 }),
  dueDate: faker.date.future().toISOString().split("T")[0], // YYYY-MM-DD 형식
}));
