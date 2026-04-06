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
exports.HorasCurso = void 0;
const typeorm_1 = require("typeorm");
const ProgramaCurso_1 = require("./ProgramaCurso");
let HorasCurso = class HorasCurso {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], HorasCurso.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "h_semanales_p_e", type: "int", default: 0 }),
    __metadata("design:type", Number)
], HorasCurso.prototype, "h_semanales_p_e", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "h_semanales_t_i", type: "int", default: 0 }),
    __metadata("design:type", Number)
], HorasCurso.prototype, "h_semanales_t_i", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "h_semanales_a_a_t", type: "int", default: 0 }),
    __metadata("design:type", Number)
], HorasCurso.prototype, "h_semanales_a_a_t", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "h_semanales_a_a_p", type: "int", default: 0 }),
    __metadata("design:type", Number)
], HorasCurso.prototype, "h_semanales_a_a_p", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "h_semanales_a_a_t_p", type: "int", default: 0 }),
    __metadata("design:type", Number)
], HorasCurso.prototype, "h_semanales_a_a_t_p", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "h_totales_curso", type: "int", default: 0 }),
    __metadata("design:type", Number)
], HorasCurso.prototype, "h_totales_curso", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ProgramaCurso_1.ProgramaCurso, (pc) => pc.horas, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "id_programa_curso" }),
    __metadata("design:type", ProgramaCurso_1.ProgramaCurso)
], HorasCurso.prototype, "programaCurso", void 0);
HorasCurso = __decorate([
    (0, typeorm_1.Entity)({ name: "horas_curso" })
], HorasCurso);
exports.HorasCurso = HorasCurso;
//# sourceMappingURL=HorasCurso.js.map