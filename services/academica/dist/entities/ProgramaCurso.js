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
exports.ProgramaCurso = void 0;
const typeorm_1 = require("typeorm");
const PlanDeEstudioCurso_1 = require("./PlanDeEstudioCurso");
const CaracteristicasCurso_1 = require("./CaracteristicasCurso");
const ClaseCurso_1 = require("./ClaseCurso");
const ModalidadCurso_1 = require("./ModalidadCurso");
const ProgramaDocente_1 = require("./ProgramaDocente");
const HorasCurso_1 = require("./HorasCurso");
const ProgramaCursoRequisito_1 = require("./ProgramaCursoRequisito");
const ProgramaMetodologiaEstrategia_1 = require("./ProgramaMetodologiaEstrategia");
const ProgramaMetodologia_1 = require("./ProgramaMetodologia");
const ProgramaEvaluacion_1 = require("./ProgramaEvaluacion");
const ProgramaBibliografia_1 = require("./ProgramaBibliografia");
let ProgramaCurso = class ProgramaCurso {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ProgramaCurso.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => PlanDeEstudioCurso_1.PlanEstudioCurso, (pec) => pec.programasCurso, {
        nullable: false,
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "id_plan_estudio_curso" }),
    __metadata("design:type", PlanDeEstudioCurso_1.PlanEstudioCurso)
], ProgramaCurso.prototype, "planCurso", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar" }),
    __metadata("design:type", String)
], ProgramaCurso.prototype, "unidad_academica", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CaracteristicasCurso_1.CaracteristicasCurso, (car) => car.programas, {
        nullable: false,
        onDelete: "RESTRICT",
    }),
    (0, typeorm_1.JoinColumn)({ name: "id_caracteristicas" }),
    __metadata("design:type", CaracteristicasCurso_1.CaracteristicasCurso)
], ProgramaCurso.prototype, "caracteristicas", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ClaseCurso_1.ClaseCurso, (cl) => cl.programas, {
        nullable: false,
        onDelete: "RESTRICT",
    }),
    (0, typeorm_1.JoinColumn)({ name: "id_clase_curso" }),
    __metadata("design:type", ClaseCurso_1.ClaseCurso)
], ProgramaCurso.prototype, "clase", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ModalidadCurso_1.ModalidadCurso, (mo) => mo.programas, {
        nullable: false,
        onDelete: "RESTRICT",
    }),
    (0, typeorm_1.JoinColumn)({ name: "id_modalidad_curso" }),
    __metadata("design:type", ModalidadCurso_1.ModalidadCurso)
], ProgramaCurso.prototype, "modalidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], ProgramaCurso.prototype, "nucleo_curso", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], ProgramaCurso.prototype, "vigencia", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], ProgramaCurso.prototype, "perfil", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "intencionalidades_formativas",
        type: "text",
        nullable: true,
    }),
    __metadata("design:type", String)
], ProgramaCurso.prototype, "intencionalidadesFormativas", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "aportes_curso_formacion", type: "text", nullable: true }),
    __metadata("design:type", String)
], ProgramaCurso.prototype, "aportesCursoFormacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "descripcion_conocimientos", type: "text", nullable: true }),
    __metadata("design:type", String)
], ProgramaCurso.prototype, "descripcionConocimientos", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "creditos",
        type: "numeric",
        precision: 5,
        scale: 2,
        nullable: true,
    }),
    __metadata("design:type", Number)
], ProgramaCurso.prototype, "creditos", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ProgramaDocente_1.ProgramaDocente, (pd) => pd.programaCurso),
    __metadata("design:type", Array)
], ProgramaCurso.prototype, "docentes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => HorasCurso_1.HorasCurso, (hc) => hc.programaCurso),
    __metadata("design:type", Array)
], ProgramaCurso.prototype, "horas", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ProgramaCursoRequisito_1.ProgramaCursoRequisito, (r) => r.programaCurso),
    __metadata("design:type", Array)
], ProgramaCurso.prototype, "requisitos", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ProgramaMetodologia_1.ProgramaMetodologia, (pm) => pm.programaCurso),
    __metadata("design:type", Array)
], ProgramaCurso.prototype, "metodologia", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ProgramaMetodologiaEstrategia_1.ProgramaMetodologiaEstrategia, (pme) => pme.programaCurso),
    __metadata("design:type", Array)
], ProgramaCurso.prototype, "estrategiasMetodologicas", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ProgramaEvaluacion_1.ProgramaEvaluacion, (pe) => pe.programaCurso),
    __metadata("design:type", Array)
], ProgramaCurso.prototype, "evaluaciones", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ProgramaBibliografia_1.ProgramaBibliografia, (b) => b.programaCurso),
    __metadata("design:type", Array)
], ProgramaCurso.prototype, "bibliografia", void 0);
ProgramaCurso = __decorate([
    (0, typeorm_1.Entity)({ name: "programas_curso" })
], ProgramaCurso);
exports.ProgramaCurso = ProgramaCurso;
//# sourceMappingURL=ProgramaCurso.js.map