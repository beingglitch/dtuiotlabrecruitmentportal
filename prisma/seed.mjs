import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const programs = ["B.Tech", "M.Tech", "BCA", "MCA"];
const branches = ["Software Engineering", "Computer Science", "Electronics", "Mechanical", "Information Technology"];
const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const genders = ["Male", "Female", "Other"];
const statuses = ["pending", "approved", "rejected"];
const cities = ["New Delhi", "Mumbai", "Bengaluru", "Pune", "Hyderabad", "Chennai"];
const states = ["Delhi", "Maharashtra", "Karnataka", "Telangana", "Tamil Nadu"];
const first = ["Aarav","Vivaan","Aditya","Diya","Ananya","Ishaan","Saanvi","Kabir","Myra","Arjun","Riya","Vihaan","Kiara","Reyansh","Anika"];
const last = ["Sharma","Verma","Gupta","Singh","Patel","Kumar","Reddy","Nair","Das","Shukla","Iyer","Mehta"];

const pick = (a) => a[Math.floor(Math.random() * a.length)];
const pad = (n) => String(n).padStart(3, "0");

async function main() {
  await prisma.student.deleteMany();
  const rows = [];
  for (let i = 0; i < 24; i++) {
    const fn = `${pick(first)} ${pick(last)}`;
    const ci = Math.floor(Math.random() * cities.length);
    rows.push({
      fullName: fn,
      dateOfBirth: `200${Math.floor(Math.random() * 6)}-0${1 + Math.floor(Math.random() * 9)}-1${Math.floor(Math.random() * 9)}`,
      gender: pick(genders),
      email: `${fn.toLowerCase().replace(/ /g, ".")}${i}@example.com`,
      phone: `9${Math.floor(100000000 + Math.random() * 899999999)}`,
      address: `${1 + Math.floor(Math.random() * 200)}, Sector ${1 + Math.floor(Math.random() * 40)}`,
      city: cities[ci],
      state: states[ci % states.length],
      program: pick(programs),
      branch: pick(branches),
      yearOfStudy: pick(years),
      rollNumber: `2K2${Math.floor(Math.random() * 6)}/SE/${pad(i + 1)}`,
      previousScore: `${(70 + Math.random() * 30).toFixed(1)}%`,
      status: pick(statuses),
    });
  }
  for (const r of rows) {
    await prisma.student.create({ data: r });
  }
  console.log(`Seeded ${rows.length} students.`);
}

main().finally(() => prisma.$disconnect());
