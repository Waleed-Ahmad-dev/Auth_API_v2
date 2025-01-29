/*
  Warnings:

  - You are about to drop the `Attendance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AttendanceCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Enrollment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Invitation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `School` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Student` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Subject` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Teacher` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserSchool` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Attendance` DROP FOREIGN KEY `Attendance_attendanceCategoryId_fkey`;

-- DropForeignKey
ALTER TABLE `Attendance` DROP FOREIGN KEY `Attendance_schoolId_fkey`;

-- DropForeignKey
ALTER TABLE `Attendance` DROP FOREIGN KEY `Attendance_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `Enrollment` DROP FOREIGN KEY `Enrollment_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `Enrollment` DROP FOREIGN KEY `Enrollment_subjectId_fkey`;

-- DropForeignKey
ALTER TABLE `Invitation` DROP FOREIGN KEY `Invitation_schoolId_fkey`;

-- DropForeignKey
ALTER TABLE `School` DROP FOREIGN KEY `School_ownerId_fkey`;

-- DropForeignKey
ALTER TABLE `Student` DROP FOREIGN KEY `Student_schoolId_fkey`;

-- DropForeignKey
ALTER TABLE `Subject` DROP FOREIGN KEY `Subject_teacherId_fkey`;

-- DropForeignKey
ALTER TABLE `Teacher` DROP FOREIGN KEY `Teacher_schoolId_fkey`;

-- DropForeignKey
ALTER TABLE `UserSchool` DROP FOREIGN KEY `UserSchool_schoolId_fkey`;

-- DropForeignKey
ALTER TABLE `UserSchool` DROP FOREIGN KEY `UserSchool_userId_fkey`;

-- DropTable
DROP TABLE `Attendance`;

-- DropTable
DROP TABLE `AttendanceCategory`;

-- DropTable
DROP TABLE `Enrollment`;

-- DropTable
DROP TABLE `Invitation`;

-- DropTable
DROP TABLE `School`;

-- DropTable
DROP TABLE `Student`;

-- DropTable
DROP TABLE `Subject`;

-- DropTable
DROP TABLE `Teacher`;

-- DropTable
DROP TABLE `UserSchool`;
