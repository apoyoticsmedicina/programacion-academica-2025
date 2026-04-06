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
exports.CronogramaGrupoDocente = void 0;
const typeorm_1 = require("typeorm");
const CronogramaGrupo_1 = require("./CronogramaGrupo");
const Docente_1 = require("./Docente");
let CronogramaGrupoDocente = class CronogramaGrupoDocente {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CronogramaGrupoDocente.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "grupo_id" }),
    __metadata("design:type", Number)
], CronogramaGrupoDocente.prototype, "grupoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CronogramaGrupo_1.CronogramaGrupo, (g) => g.docentes, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "grupo_id" }),
    __metadata("design:type", CronogramaGrupo_1.CronogramaGrupo)
], CronogramaGrupoDocente.prototype, "grupo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "docente_id" }),
    __metadata("design:type", Number)
], CronogramaGrupoDocente.prototype, "docenteId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Docente_1.Docente, (d) => d.gruposCronograma, { onDelete: "RESTRICT" }),
    (0, typeorm_1.JoinColumn)({ name: "docente_id" }),
    __metadata("design:type", Docente_1.Docente)
], CronogramaGrupoDocente.prototype, "docente", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], CronogramaGrupoDocente.prototype, "horas", void 0);
CronogramaGrupoDocente = __decorate([
    (0, typeorm_1.Entity)({ name: "cronograma_grupos_docentes" })
], CronogramaGrupoDocente);
exports.CronogramaGrupoDocente = CronogramaGrupoDocente;
//# sourceMappingURL=CronogramaGrupoDocente.js.map