# Class Diagram

```mermaid
classDiagram

class Person {
  +int id
  +string name
  +date dob
}

class Student {
  +string studentNumber
}

class Reading {
  +int id
  +DateTime takenAt
  +int heightIn
  +float weightLb
  +float spo2Pct
  +float tempF
  +int heartRate
  +int respRate
  +int systolicBp
  +int diastolicBp
}

class StudentReading {
  +int id
  +boolean isCorrect
  +DateTime gradedAt
  +string instructorNotes
  +calculateGrade() int
}

Person <|-- Student

Person "1" --> "0..*" Reading : hasReadings
Person "1" --> "0..1" Reading : baselineReading

Student "1" --> "0..*" StudentReading : submits
Reading "1" --> "0..*" StudentReading : evaluatedIn

Person "0..*" --> "0..*" Person : friendsWith
