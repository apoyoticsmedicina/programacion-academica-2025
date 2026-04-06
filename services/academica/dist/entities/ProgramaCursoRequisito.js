"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgramaCursoRequisito = void 0;
// src/entities/ProgramaCursoRequisito.ts
const typeorm_1 = require("typeorm");
const ProgramaCurso_1 = require("./ProgramaCurso");
const Curso_1 = require("./Curso");
let ProgramaCursoRequisito = class ProgramaCursoRequisito {
};
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "programa_curso_id", type: "int" }),
    __metadata("design:type", Number)
], ProgramaCursoRequisito.prototype, "programaCursoId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "curso_id", type: "int" }),
    __metadata("design:type", Number)
], ProgramaCursoRequisito.prototype, "cursoId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "requisito_curso_id", type: "int" }),
    __metadata("design:type", Number)
], ProgramaCursoRequisito.prototype, "requisitoCursoId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "tipo", type: "varchar" }),
    __metadata("design:type", String)
], ProgramaCursoRequisito.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ProgramaCurso_1.ProgramaCurso, (pc) => pc.requisitos, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "programa_curso_id" }),
    __metadata("design:type", ProgramaCurso_1.ProgramaCurso)
], ProgramaCursoRequisito.prototype, "programaCurso", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Curso_1.Curso, (c) => c.requisitosComoPrincipal, { onDelete: "RESTRICT" }),
    (0, typeorm_1.JoinColumn)({ name: "curso_id" }),
    __metadata("design:type", Curso_1.Curso)
], ProgramaCursoRequisito.prototype, "curso", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Curso_1.Curso, (c) => c.requisitosComoRequisito, { onDelete: "RESTRICT" }),
    (0, typeorm_1.JoinColumn)({ name: "requisito_curso_id" }),
    __metadata("design:type", Curso_1.Curso)
], ProgramaCursoRequisito.prototype, "requisito", void 0);
ProgramaCursoRequisito = __decorate([
    (0, typeorm_1.Entity)({ name: "programa_curso_requisitos" })
], ProgramaCursoRequisito);
exports.ProgramaCursoRequisito = ProgramaCursoRequisito;
//# sourceMappingURL=ProgramaCursoRequisito.js.map