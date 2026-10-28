# Implementation Plan - Simple Student Management System (DBMS Project)

## Instrucciones de bucle (ralph)

Cada iteración ejecuta **una sola** acción y termina. No encadenes tareas.

1. **Localizar la siguiente subtarea**:
   - Recorre `plan.md` de arriba a abajo y encuentra el primer `[ ]`.
   - Si la línea enlaza a un fichero `task/NN.md`, abre el fichero y repite la búsqueda recursivamente dentro de él hasta llegar a una subtarea `[ ]` hoja (sin enlace).
   - Si no encuentras ningún `[ ]` en ninguna parte → **crea `plan/stop.md`** con una nota breve ("plan completo, sin subtareas pendientes") y **para**. El fichero `stop.md` es la señal que `ralph-loop.sh` usa para detenerse; sin él el bucle sigue iterando aunque no haya trabajo.
2. **Ejecutar esa única subtarea**:
   - Subtarea normal: realízala y márcala `[x]`.
   - Subtarea `[juez]`: invoca la skill `juez` sobre el repositorio pasándole las instrucciones del fichero `task/NN.md` correspondiente. La skill juzgará la evidencia y actualizará el fichero.
   - Si la subtarea consiste en **añadir** nuevas subtareas o crear un nuevo `task/NN.md`: añádelas y **no las ejecutes**; crear tareas cuenta como la acción única de la iteración.
   - **Excepción**: si al inspeccionar la subtarea descubres que el trabajo **ya está hecho** (el código/artefacto/condición existe sin necesidad de cambios), márcala `[x]` y **continúa con la siguiente subtarea en la misma iteración**. Marcar tareas ya completadas no cuenta como la acción única del bucle; solo el trabajo real (implementar, crear tareas, invocar a la juez) consume la iteración.
3. **Propagar hacia arriba**:
   - Tras marcar una subtarea, si **todas** las subtareas del `task/NN.md` están `[x]`, marca también la entrada correspondiente en `plan.md` como `[x]`.
4. **Parar**. No busques la siguiente subtarea, no encadenes iteraciones.

## Objetivo
Transform the existing college management codebase into a simple, clean, reliable, and functional Student Management System for a DBMS college project review.

## Tareas

- [x] Task 1: Fix Backend POM and Spring Boot configuration [task/01_backend_config.md](task/01_backend_config.md)
- [x] Task 2: Update Student Model, DTO, Repository, and Service for Year of Study and clean CRUD [task/02_backend_student_crud.md](task/02_backend_student_crud.md)
- [x] Task 3: Simplify Database Schema, Seed Data, and Department count support [task/03_database_and_seed.md](task/03_database_and_seed.md)
- [x] Task 4: Redesign Frontend with clean college styling, Dashboard, and Student Management [task/04_frontend_redesign.md](task/04_frontend_redesign.md)
- [x] Task 5: Verify Build, Data Flow, and Document for College Review [task/05_verification_and_docs.md](task/05_verification_and_docs.md)
