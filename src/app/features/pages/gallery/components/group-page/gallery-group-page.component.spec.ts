import { TestBed } from '@angular/core/testing';
import { convertToParamMap, ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { GalleryGroupPageComponent } from './gallery-group-page.component';

describe('GalleryGroupPageComponent', () => {
  const paramMap$ = new BehaviorSubject(convertToParamMap({ group: 'korea' }));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GalleryGroupPageComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: paramMap$.asObservable() },
        },
      ],
    }).compileComponents();
  });

  it('loads gallery from route param', () => {
    const fixture = TestBed.createComponent(GalleryGroupPageComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.gallery).toBeTruthy();
    expect(fixture.componentInstance.gallery?.galleryKey).toBe('korea');
  });

  it('opens and closes portfolio modal state', () => {
    const fixture = TestBed.createComponent(GalleryGroupPageComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    const model = component.gallery?.models[0];
    expect(model).toBeTruthy();

    component.openModel(model!);
    expect(component.selectedModel?.id).toBe(model!.id);

    component.closeModel();
    expect(component.selectedModel).toBeNull();
    expect(component.selectedMediaIndex).toBeNull();
  });
});
