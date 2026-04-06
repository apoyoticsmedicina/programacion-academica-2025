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
exports.Curso = void 0;
const typeorm_1 = require("typeorm");
const PlanDeEstudioCurso_1 = require("./PlanDeEstudioCurso");
const ProgramaCursoRequisito_1 = require("./ProgramaCursoRequisito");
const CronogramaGrupo_1 = require("./CronogramaGrupo");
const UsuarioCurso_1 = require("./UsuarioCurso");
let Curso = class Curso {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Curso.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)({ unique: true }),
    (0, typeorm_1.Column)({ type: "varchar" }),
    __metadata("design:type", String)
], Curso.prototype, "codigo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar" }),
    __metadata("design:type", String)
], Curso.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => PlanDeEstudioCurso_1.PlanEstudioCurso, (pec) => pec.curso),
    __metadata("design:type", Array)
], Curso.prototype, "planes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ProgramaCursoRequisito_1.ProgramaCursoRequisito, (r) => r.curso),
    __metadata("design:type", Array)
], Curso.prototype, "requisitosComoPrincipal", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ProgramaCursoRequisito_1.ProgramaCursoRequisito, (r) => r.requisito),
    __metadata("design:type", Array)
], Curso.prototype, "requisitosComoRequisito", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CronogramaGrupo_1.CronogramaGrupo, (g) => g.curso),
    __metadata("design:type", Array)
], Curso.prototype, "gruposCronograma", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => UsuarioCurso_1.UsuarioCurso, (uc) => uc.curso),
    __metadata("design:type", Array)
], Curso.prototype, "coordinadores", void 0);
Curso = __decorate([
    (0, typeorm_1.Entity)({ name: "cursos" })
], Curso);
exports.Curso = Curso;
//# sourceMappingURL=Curso.js.map