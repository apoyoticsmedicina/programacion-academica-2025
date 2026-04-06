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
exports.ProgramaMetodologia = void 0;
// src/entities/ProgramaMetodologia.ts
const typeorm_1 = require("typeorm");
const ProgramaCurso_1 = require("./ProgramaCurso");
let ProgramaMetodologia = class ProgramaMetodologia {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ProgramaMetodologia.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ProgramaCurso_1.ProgramaCurso, (pc) => pc.metodologia, {
        nullable: false,
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "id_programa_curso" }),
    __metadata("design:type", ProgramaCurso_1.ProgramaCurso)
], ProgramaMetodologia.prototype, "programaCurso", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "medios_y_recursos", type: "text", nullable: true }),
    __metadata("design:type", String)
], ProgramaMetodologia.prototype, "mediosYRecursos", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "formas_interaccion", type: "text", nullable: true }),
    __metadata("design:type", String)
], ProgramaMetodologia.prototype, "formasInteraccion", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "estrategias_internacionalizacion",
        type: "text",
        nullable: true,
    }),
    __metadata("design:type", String)
], ProgramaMetodologia.prototype, "estrategiasInternacionalizacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "estrategias_enfoque", type: "text", nullable: true }),
    __metadata("design:type", String)
], ProgramaMetodologia.prototype, "estrategiasEnfoque", void 0);
ProgramaMetodologia = __decorate([
    (0, typeorm_1.Entity)({ name: "programas_metodologia" })
], ProgramaMetodologia);
exports.ProgramaMetodologia = ProgramaMetodologia;
//# sourceMappingURL=ProgramaMetodologia.js.map