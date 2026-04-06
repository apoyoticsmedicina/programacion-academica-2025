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
exports.SolicitudCambio = void 0;
const typeorm_1 = require("typeorm");
const Usuario_1 = require("./Usuario");
const Curso_1 = require("./Curso");
const ProgramaCurso_1 = require("./ProgramaCurso");
let SolicitudCambio = class SolicitudCambio {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SolicitudCambio.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Curso_1.Curso, { nullable: false, onDelete: "RESTRICT" }),
    (0, typeorm_1.JoinColumn)({ name: "curso_id" }),
    (0, typeorm_1.Index)("IDX_sc_curso"),
    __metadata("design:type", Curso_1.Curso)
], SolicitudCambio.prototype, "curso", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ProgramaCurso_1.ProgramaCurso, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "programa_curso_id" }),
    (0, typeorm_1.Index)("IDX_sc_programa_curso"),
    __metadata("design:type", ProgramaCurso_1.ProgramaCurso)
], SolicitudCambio.prototype, "programaCurso", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Usuario_1.Usuario, { nullable: false, onDelete: "RESTRICT" }),
    (0, typeorm_1.JoinColumn)({ name: "solicitante_id" }),
    (0, typeorm_1.Index)("IDX_sc_solicitante"),
    __metadata("design:type", Usuario_1.Usuario)
], SolicitudCambio.prototype, "solicitante", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", default: "pendiente" }),
    (0, typeorm_1.Index)("IDX_sc_estado"),
    __metadata("design:type", String)
], SolicitudCambio.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", Object)
], SolicitudCambio.prototype, "motivo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", default: () => "'{}'::jsonb" }),
    __metadata("design:type", Object)
], SolicitudCambio.prototype, "propuesta", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", nullable: true }),
    __metadata("design:type", Object)
], SolicitudCambio.prototype, "snapshot", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", Object)
], SolicitudCambio.prototype, "comentario_admin", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Usuario_1.Usuario, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "resuelto_por" }),
    __metadata("design:type", Object)
], SolicitudCambio.prototype, "resueltoPor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamptz", nullable: true }),
    __metadata("design:type", Object)
], SolicitudCambio.prototype, "resuelto_en", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamptz", default: () => "now()" }),
    __metadata("design:type", Date)
], SolicitudCambio.prototype, "creado_en", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamptz", default: () => "now()" }),
    __metadata("design:type", Date)
], SolicitudCambio.prototype, "actualizado_en", void 0);
SolicitudCambio = __decorate([
    (0, typeorm_1.Entity)({ name: "solicitudes_cambio" })
], SolicitudCambio);
exports.SolicitudCambio = SolicitudCambio;
//# sourceMappingURL=SolicitudCambio.js.map