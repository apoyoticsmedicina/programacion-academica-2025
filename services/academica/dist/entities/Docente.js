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
exports.Docente = void 0;
const typeorm_1 = require("typeorm");
const ProgramaDocente_1 = require("./ProgramaDocente");
const CronogramaGrupoDocente_1 = require("./CronogramaGrupoDocente");
let Docente = class Docente {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Docente.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, default: "CC" }),
    __metadata("design:type", String)
], Docente.prototype, "tipo_documento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", unique: true }),
    __metadata("design:type", String)
], Docente.prototype, "documento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar" }),
    __metadata("design:type", String)
], Docente.prototype, "nombres", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar" }),
    __metadata("design:type", String)
], Docente.prototype, "apellidos", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar" }),
    __metadata("design:type", String)
], Docente.prototype, "vinculacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar" }),
    __metadata("design:type", String)
], Docente.prototype, "dedicacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar" }),
    __metadata("design:type", String)
], Docente.prototype, "departamento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar" }),
    __metadata("design:type", String)
], Docente.prototype, "unidad_academica", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], Docente.prototype, "activo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], Docente.prototype, "correo_institucional", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], Docente.prototype, "correo_personal", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ProgramaDocente_1.ProgramaDocente, (pd) => pd.docente),
    __metadata("design:type", Array)
], Docente.prototype, "programasAsignados", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CronogramaGrupoDocente_1.CronogramaGrupoDocente, (gd) => gd.docente),
    __metadata("design:type", Array)
], Docente.prototype, "gruposCronograma", void 0);
Docente = __decorate([
    (0, typeorm_1.Entity)({ name: "docentes" })
], Docente);
exports.Docente = Docente;
//# sourceMappingURL=Docente.js.map