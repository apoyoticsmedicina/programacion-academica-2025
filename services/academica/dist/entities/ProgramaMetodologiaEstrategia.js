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
exports.ProgramaMetodologiaEstrategia = void 0;
// src/entities/ProgramaMetodologiaEstrategia.ts
const typeorm_1 = require("typeorm");
const ProgramaCurso_1 = require("./ProgramaCurso");
const EstrategiaDidactica_1 = require("./EstrategiaDidactica");
let ProgramaMetodologiaEstrategia = class ProgramaMetodologiaEstrategia {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ProgramaMetodologiaEstrategia.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ProgramaCurso_1.ProgramaCurso, (pc) => pc.estrategiasMetodologicas, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "id_programa_curso" }),
    __metadata("design:type", ProgramaCurso_1.ProgramaCurso)
], ProgramaMetodologiaEstrategia.prototype, "programaCurso", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => EstrategiaDidactica_1.EstrategiaDidactica, (e) => e.programasMetodologia, { nullable: false, onDelete: "RESTRICT" }),
    (0, typeorm_1.JoinColumn)({ name: "id_estrategia_didactica" }),
    __metadata("design:type", EstrategiaDidactica_1.EstrategiaDidactica)
], ProgramaMetodologiaEstrategia.prototype, "estrategia", void 0);
ProgramaMetodologiaEstrategia = __decorate([
    (0, typeorm_1.Entity)({ name: "programas_metodologia_estrategias" })
], ProgramaMetodologiaEstrategia);
exports.ProgramaMetodologiaEstrategia = ProgramaMetodologiaEstrategia;
//# sourceMappingURL=ProgramaMetodologiaEstrategia.js.map