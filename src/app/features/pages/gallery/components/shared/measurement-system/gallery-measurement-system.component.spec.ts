import { TestBed } from '@angular/core/testing';
import { GalleryMeasurementSystemComponent } from './gallery-measurement-system.component';
import { GalleryModel } from '../../../data/scouting-model.types';

describe('GalleryMeasurementSystemComponent', () => {
  const model: GalleryModel = {
    id: 'test-model',
    name: 'Test Model',
    cover: '/test.jpg',
    height: '1.85m',
    measurements: 'W 75cm',
    ongoingTrip: false,
    portfolio: ['/test.jpg'],
    instagram: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GalleryMeasurementSystemComponent],
    }).compileComponents();
  });

  it('switches from metric to imperial values', () => {
    const fixture = TestBed.createComponent(GalleryMeasurementSystemComponent);
    const component = fixture.componentInstance;
    component.model = model;

    expect(component.formattedHeight).toContain('m');

    component.useImperial();

    expect(component.formattedHeight).toContain("'");
    expect(component.formattedMeasurements).toContain('"');
  });
});
