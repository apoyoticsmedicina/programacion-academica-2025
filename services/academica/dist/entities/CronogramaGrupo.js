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
exports.CronogramaGrupo = void 0;
const typeorm_1 = require("typeorm");
const Curso_1 = require("./Curso");
const CronogramaGrupoDocente_1 = require("./CronogramaGrupoDocente");
let CronogramaGrupo = class CronogramaGrupo {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CronogramaGrupo.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "curso_id" }),
    __metadata("design:type", Number)
], CronogramaGrupo.prototype, "cursoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Curso_1.Curso, (c) => c.gruposCronograma, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "curso_id" }),
    __metadata("design:type", Curso_1.Curso)
], CronogramaGrupo.prototype, "curso", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100 }),
    __metadata("design:type", String)
], CronogramaGrupo.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CronogramaGrupoDocente_1.CronogramaGrupoDocente, (gd) => gd.grupo),
    __metadata("design:type", Array)
], CronogramaGrupo.prototype, "docentes", void 0);
CronogramaGrupo = __decorate([
    (0, typeorm_1.Entity)({ name: "cronograma_grupos" })
], CronogramaGrupo);
exports.CronogramaGrupo = CronogramaGrupo;
//# sourceMappingURL=CronogramaGrupo.js.map