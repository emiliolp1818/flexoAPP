import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CargaProgramas } from './carga-programas';
import { ProductionService } from '../../services/production.service';
import { of } from 'rxjs';

describe('CargaProgramas', () => {
  let component: CargaProgramas;
  let fixture: ComponentFixture<CargaProgramas>;
  let mockProductionService: jasmine.SpyObj<ProductionService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ProductionService', ['loadMachines', 'createWorkOrder']);

    await TestBed.configureTestingModule({
      imports: [CargaProgramas],
      providers: [
        { provide: ProductionService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CargaProgramas);
    component = fixture.componentInstance;
    mockProductionService = TestBed.inject(ProductionService) as jasmine.SpyObj<ProductionService>;
    
    // Mock return values
    mockProductionService.loadMachines.and.returnValue(of([]));
    mockProductionService.createWorkOrder.and.returnValue(of({} as any));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load machines on init', () => {
    component.ngOnInit();
    expect(mockProductionService.loadMachines).toHaveBeenCalled();
  });

  it('should toggle machine selection', () => {
    component.toggleMachineSelection(11);
    expect(component.selectedMachines()).toContain(11);
    
    component.toggleMachineSelection(11);
    expect(component.selectedMachines()).not.toContain(11);
  });

  it('should calculate total programs correctly', () => {
    component.selectedMachines.set([11, 12, 13]);
    expect(component.totalProgramsToLoad()).toBe(30);
  });
});