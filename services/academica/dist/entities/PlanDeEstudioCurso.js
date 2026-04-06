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
exports.PlanEstudioCurso = void 0;
const typeorm_1 = require("typeorm");
const PlanDeEstudio_1 = require("./PlanDeEstudio");
const Curso_1 = require("./Curso");
const TipoCurso_1 = require("./TipoCurso");
const ProgramaCurso_1 = require("./ProgramaCurso");
let PlanEstudioCurso = class PlanEstudioCurso {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PlanEstudioCurso.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => PlanDeEstudio_1.PlanDeEstudio, (p) => p.cursos, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "plan_estudio_id" }),
    __metadata("design:type", PlanDeEstudio_1.PlanDeEstudio)
], PlanEstudioCurso.prototype, "plan", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Curso_1.Curso, (c) => c.planes, { nullable: false, onDelete: "RESTRICT" }),
    (0, typeorm_1.JoinColumn)({ name: "curso_id" }),
    __metadata("design:type", Curso_1.Curso)
], PlanEstudioCurso.prototype, "curso", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => TipoCurso_1.TipoCurso, (t) => t.cursosEnPlanes, { nullable: false, onDelete: "RESTRICT" }),
    (0, typeorm_1.JoinColumn)({ name: "tipo_curso_id" }),
    __metadata("design:type", TipoCurso_1.TipoCurso)
], PlanEstudioCurso.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], PlanEstudioCurso.prototype, "nivel", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ProgramaCurso_1.ProgramaCurso, (pc) => pc.planCurso),
    __metadata("design:type", Array)
], PlanEstudioCurso.prototype, "programasCurso", void 0);
PlanEstudioCurso = __decorate([
    (0, typeorm_1.Entity)({ name: "plan_estudio_cursos" }),
    (0, typeorm_1.Unique)(["plan", "curso"]) // evita repetir el mismo curso en un plan
], PlanEstudioCurso);
exports.PlanEstudioCurso = PlanEstudioCurso;
//# sourceMappingURL=PlanDeEstudioCurso.js.map