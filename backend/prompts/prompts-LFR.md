### 1.- Conexión con dbhub

Vamos a trabajar con una base de datos PostgreSQL y prisma como ORM. La base de datos ya está arrancada; configura el MCP de dbhub para que se pueda conectar a ella; los datos para la conexión los tienes en @.env. Si tienen alguna duda preguntame.

### 2.- Coherencia con el schema actual

Queremos desarrollar una nueva funcionalidad en nuestro sistema ATS que nos permita incluir el flujo completo de una candidatura; ya tenemos un ERD para esta funcionalidad @backend/prisma/ERD.md , el esquema actual está definido en @backend/prisma/schema.prisma.  
OBJETIVO: debes comparar el esquema actual en prisma con el ERD futuro que se quiere implementar identificado incoherencias e incompatibilidades. No analices el nuevo ERD solo revisa si ambos esquemas son coherentes y por tanto se puede evolucionar del actual al prropuesto.

Vamos a alinear completamente las discrepancias de los dos archivos para evitar problemas. Por ahora solo quiero que los dos archivos sean coherentes entre sí y en las normas que usan, no valides si ERD es coherente con la funcionalidad que se pide, eso lo haremos más trade. Arregla estas incoherencias;  
1.- en el ERD cambia el nombre de las entidades a camelcase, para seguir el estandar de schema.prisma  
2.- incluye la unicidad de mail en  el ERD  
3.- En el ERD no están definidas las longitudes de los string ni las opcionalidades, por tanto en este punto no hacemos nada  
4.- mantenemos que ERD hable siempre de date y Prisma DateTime (es una diferencia aceptable dado que son niveles distintos; lógivo vs físico)

### 3.- Validacione ERD

El modelo describe el flujo de entrevistas del candidato. Actua como un Analista de Negocio experto en RRHH y con solidos conocimientos en modelado de BD y explicame estas relaciones 1::1 que no acabo de entender (en algunos casos parece que deberían ser 1::N):  
POSITION ||--|| INTERVIEW_FLOW : assigns,  
INTERVIEW_STEP ||--|| INTERVIEW_TYPE ,  
INTERVIEW ||--|| INTERVIEW_STEP : consists_of. 

Modifica las cardinalidades en el ERD

Analiza si el diagrama propuesto esté en 3FN (normalizado hasta la tercera forma normal)

1.- Revisa ERD, con el cambio de cardinalidad se han perdido las modificaciones anteriores CamelCase; deben mantenerse los ambos cambios (mira también que no se haya perdido nada más)  
2.- Después, elimina del modelo   text company_description; este dato se saca de company; si en el futuro necesitaramos histórico se analizaría como implementarlos. El contact_info se mantiene, depdende de la posicion  
3.- El nombre del paso es propio Entrevista técnica con el equipo X, por lo que se mantiene

### 4.- Convertir ERD a schema.prisma

Vamos a pasar el ERD a prisma. 
Crea un model por cada entidad: Company, Employee, Position, InterviewFlow, InterviewStep, InterviewType, Application, Interview. (Candidate ya existe.)  
Mapea tipos lógicos a Prisma: campos phone y status → String @db.VarChar(15), resto de campos string → String @db.VarChar(100), text → String @db.Text, numeric → Decimal, date → DateTime, boolean → Boolean, int → Int.
Marca PKs (@id @default(autoincrement())) y unicidades (@unique, p. ej. Candidate.email).  
Reflejar opcionalidad (?) según se decida.

### 5.- Convertir/revisar relaciones ERD a schema.prisma

Para cada N:1 del ERD, comprueba que existe el campo FK + @relation(fields: […], references: [id]) y, en el lado “uno”, la colección inversa (p. ej. interviews Interview[]).

Define onDelete Restrict para InterviewFlow/InterviewType/Position  
Define onDelete Cascade para Application → Interview

Define onUpdate Restrict para todos los casos (no se permite modificar la clave primaria en ningún caso)

### 6.- Indices y retricciones schema.prisma

Revisa que todas las tablas del esquema tengan bien definida su clave primaria.

Crea indices en todas las columnas que tengan una FK.

De cara a las consultas comunes del sistema. propon aquellos indices que puedan mejorar el rendimiento como por ejemplo el mail del candidadto.

Vamos a añadir una restricción para status de position y otra para status de application. Los valores posibles en Position son: BORRADOR. PUBLICADA, ENCURSO,  ASIGNADA. Los valores de status para application son ACEPTADA, RECHAZADA, ELEGIDA

### 7.- Creación de la BD

Vamos a crear las tablas en la base de datos con prisma; prepara un plan que abarque:  
1.- carga de datos semilla en las tablas InterviewFlow, InterviewType e InterviewStep; propon tú un set realista de datos  
2.- Lanzar los procesos de migración de prisma para crear las tablas en la BD

Ejecuta la migración de prisma

### 8.- Comprobación con dbhub

Usa dbhub para mostrarme los interviewFlow cargados en base de datos, no uses docker-compose ni entres en el contenedor; quiero comprobar que se puede ejecutar una consulta desde el mcp de dbhub