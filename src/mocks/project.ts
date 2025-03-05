import { useEffect, useState } from "react";
import { faker } from "@faker-js/faker";

export interface Project {
  name: string;
  manager: string;
  progress: number;
  dueDate: string;
}

const ProjectMock = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const generateList = (count: number): Project[] => {
      return Array.from({ length: count }, () => ({
        name: faker.company.name(),
        manager: faker.person.fullName(),
        progress: faker.number.int({ min: 0, max: 100 }),
        dueDate: faker.date.future().toISOString().split("T")[0],
      }));
    };

    setProjects(generateList(10));
  }, []);

  return projects;
};

export default ProjectMock;
