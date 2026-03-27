import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsiganarCoordinadorComponent } from './asiganar-coordinador.component';

describe('AsiganarCoordinadorComponent', () => {
  let component: AsiganarCoordinadorComponent;
  let fixture: ComponentFixture<AsiganarCoordinadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsiganarCoordinadorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsiganarCoordinadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
