# Modelo entidad-relación (ERD)



```mermaid
erDiagram
    Company["Empresa"] {
        int id PK "Identificador"
        string name "Nombre legal"
    }
    Employee["Empleado"] {
        int id PK "Identificador"
        int companyId FK "Empresa"
        string name "Nombre completo"
        string email "Correo"
        string role "Rol en la organización"
        boolean isActive "Activo"
    }
    Position["Puesto / vacante"] {
        int id PK "Identificador"
        int companyId FK "Empresa"
        int interviewFlowId FK "Flujo de entrevista"
        string title "Título del puesto"
        text description "Descripción breve"
        string status "Estado de la vacante"
        boolean isVisible "Visible públicamente"
        string location "Ubicación"
        text jobDescription "Descripción del trabajo"
        text requirements "Requisitos"
        text responsibilities "Responsabilidades"
        numeric salaryMin "Salario mínimo"
        numeric salaryMax "Salario máximo"
        string employmentType "Tipo de contrato"
        text benefits "Beneficios"
        date applicationDeadline "Fecha límite de postulación"
        string contactInfo "Datos de contacto (por vacante)"
    }
    InterviewFlow["Flujo de entrevista"] {
        int id PK "Identificador"
        string description "Descripción del flujo"
    }
    InterviewStep["Paso de entrevista"] {
        int id PK "Identificador"
        int interviewFlowId FK "Flujo"
        int interviewTypeId FK "Tipo de entrevista"
        string name "Nombre del paso en el flujo"
        int orderIndex "Orden en el flujo"
    }
    InterviewType["Tipo de entrevista"] {
        int id PK "Identificador"
        string name "Nombre"
        text description "Descripción"
    }
    Candidate["Candidato"] {
        int id PK "Identificador"
        string firstName "Nombre"
        string lastName "Apellidos"
        string email UK "Correo (único)"
        string phone "Teléfono"
        string address "Dirección"
    }
    Application["Candidatura / solicitud"] {
        int id PK "Identificador"
        int positionId FK "Puesto"
        int candidateId FK "Candidato"
        date applicationDate "Fecha de postulación"
        string status "Estado"
        text notes "Notas"
    }
    Interview["Entrevista"] {
        int id PK "Identificador"
        int applicationId FK "Candidatura"
        int interviewStepId FK "Paso del flujo"
        int employeeId FK "Entrevistador"
        date interviewDate "Fecha de la entrevista"
        string result "Resultado"
        int score "Puntuación"
        text notes "Notas"
    }

    Company ||--o{ Employee : emplea
    Company ||--o{ Position : publica
    InterviewFlow ||--o{ Position : reutilizado_en
    InterviewFlow ||--o{ InterviewStep : incluye
    InterviewType ||--o{ InterviewStep : clasifica
    Position ||--o{ Application : recibe
    Candidate ||--o{ Application : presenta
    Application ||--o{ Interview : genera
    InterviewStep ||--o{ Interview : instancia_de
    Employee ||--o{ Interview : conduce
```


## Notas sobre cardinalidades

- **Position → InterviewFlow**: varias vacantes pueden compartir el mismo flujo. *Ejemplo:* las ofertas «Desarrollador backend (Madrid)», «Desarrollador backend (remoto)» y «Tech lead backend» reutilizan el mismo flujo «Estándar ingeniería — 3 fases»; cada oferta sigue apuntando a **un** `interviewFlowId`, pero ese flujo no es exclusivo de una sola oferta.
- **InterviewStep → InterviewType**: varios pasos pueden reutilizar el mismo tipo. *Ejemplo:* en un flujo, el paso 1 se llama «Screening con RRHH» y el paso 4 «Seguimiento telefónico»; ambos pueden ser de tipo **«Llamada»** (`interviewTypeId` repetido); otro flujo distinto puede volver a usar el tipo «Llamada» en otros pasos.
- **Interview → InterviewStep**: muchas entrevistas concretas referencian la misma definición de paso. *Ejemplo:* cincuenta candidaturas distintas generan cincuenta filas en `Interview`, pero todas referencian el mismo `interviewStepId` del paso «Entrevista técnica — panel» definido en el flujo de esa vacante.
- **Entrevista → paso (regla de negocio)**: cada entrevista concreta corresponde a **un** paso del flujo asignado a la vacante de esa candidatura. *Ejemplo:* la candidatura de Ana a la oferta «Backend senior» usa el flujo F; la entrevista del 12/05 debe enlazar un paso que pertenezca a F (p. ej. «Técnica con el equipo X»), no un paso definido en el flujo de otra oferta u otra empresa.

## Notas sobre normalización

La descripción corporativa para candidatos se obtiene de **Company**; no se modela texto duplicado en la vacante. **`contactInfo`** describe datos de contacto **propios de la publicación** (p. ej. canal o persona para esa posición). El **`name`** de **InterviewStep** es el rótulo del paso en ese flujo (p. ej. «Entrevista técnica con el equipo X»), no una copia del nombre del tipo de entrevista.

## Convenciones alineadas con `schema.prisma`

- **Entidades**: mismos identificadores que los `model` (PascalCase).
- **Campos**: camelCase; restricción **única** en `Candidate.email` como `UK`, equivalente a `@unique` en Prisma.
- **Fechas solo con parte de día**: en el ERD se documentan como `date`; en Prisma se modelan como `DateTime` (mapeo físico, p. ej. tipo fecha en PostgreSQL cuando aplique).


