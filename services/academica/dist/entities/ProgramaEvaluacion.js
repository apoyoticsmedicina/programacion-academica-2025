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
exports.ProgramaEvaluacion = void 0;
const typeorm_1 = require("typeorm");
const ProgramaCurso_1 = require("./ProgramaCurso");
let ProgramaEvaluacion = class ProgramaEvaluacion {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ProgramaEvaluacion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ProgramaCurso_1.ProgramaCurso, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "id_programa_curso" }),
    __metadata("design:type", ProgramaCurso_1.ProgramaCurso)
], ProgramaEvaluacion.prototype, "programaCurso", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "momentos_evaluacion", type: "text", nullable: false }),
    __metadata("design:type", String)
], ProgramaEvaluacion.prototype, "momentosEvaluacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "porcentaje", type: "numeric", precision: 5, scale: 2, nullable: false }),
    __metadata("design:type", Number)
], ProgramaEvaluacion.prototype, "porcentaje", void 0);
ProgramaEvaluacion = __decorate([
    (0, typeorm_1.Entity)({ name: "programas_evaluacion" })
], ProgramaEvaluacion);
exports.ProgramaEvaluacion = ProgramaEvaluacion;
//# sourceMappingURL=ProgramaEvaluacion.js.map