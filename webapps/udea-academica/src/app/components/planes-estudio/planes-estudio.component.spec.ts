import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanesEstudioComponent } from './planes-estudio.component';

describe('PlanesEstudioComponent', () => {
  let component: PlanesEstudioComponent;
  let fixture: ComponentFixture<PlanesEstudioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanesEstudioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanesEstudioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
