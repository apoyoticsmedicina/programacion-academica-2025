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
exports.PlanDeEstudio = void 0;
const typeorm_1 = require("typeorm");
const ProgramaAcademico_1 = require("./ProgramaAcademico");
const Cohorte_1 = require("./Cohorte");
const PlanDeEstudioCurso_1 = require("./PlanDeEstudioCurso");
let PlanDeEstudio = class PlanDeEstudio {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PlanDeEstudio.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ProgramaAcademico_1.ProgramaAcademico, (p) => p.planes, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "programa_id" }),
    __metadata("design:type", ProgramaAcademico_1.ProgramaAcademico)
], PlanDeEstudio.prototype, "programa", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar" }),
    __metadata("design:type", String)
], PlanDeEstudio.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Cohorte_1.Cohorte, (c) => c.planes, { nullable: false, onDelete: "RESTRICT" }),
    (0, typeorm_1.JoinColumn)({ name: "id_cohorte" }),
    __metadata("design:type", Cohorte_1.Cohorte)
], PlanDeEstudio.prototype, "cohorte", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], PlanDeEstudio.prototype, "activo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], PlanDeEstudio.prototype, "niveles", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => PlanDeEstudioCurso_1.PlanEstudioCurso, (pec) => pec.plan),
    __metadata("design:type", Array)
], PlanDeEstudio.prototype, "cursos", void 0);
PlanDeEstudio = __decorate([
    (0, typeorm_1.Entity)({ name: "planes_estudio" }),
    (0, typeorm_1.Unique)(["programa", "version", "cohorte"]) // evita duplicados de una versión por cohorte
], PlanDeEstudio);
exports.PlanDeEstudio = PlanDeEstudio;
//# sourceMappingURL=PlanDeEstudio.js.map