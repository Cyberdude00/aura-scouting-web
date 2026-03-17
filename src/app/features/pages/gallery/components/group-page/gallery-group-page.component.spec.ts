import { TestBed } from '@angular/core/testing';
import { convertToParamMap, ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { GalleryGroupPage } from './gallery-group-page.component';

describe('GalleryGroupPage', () => {
  const paramMap$ = new BehaviorSubject(convertToParamMap({ group: 'korea' }));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GalleryGroupPage],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: paramMap$.asObservable() },
        },
      ],
    }).compileComponents();
  });

  it('loads gallery from route param', () => {
    const fixture = TestBed.createComponent(GalleryGroupPage);
    fixture.detectChanges();

    expect(fixture.componentInstance.gallery).toBeTruthy();
    expect(fixture.componentInstance.gallery?.galleryKey).toBe('korea');
  });

  it('opens and closes portfolio modal state', () => {
    const fixture = TestBed.createComponent(GalleryGroupPage);
    fixture.detectChanges();
    const component = fixture.componentInstance as GalleryGroupPage;

    const model = component.gallery?.models[0];
    expect(model).toBeTruthy();

    component.openModel({ model: model!, initialIndex: 0 });
    expect(component.selectedModel?.id).toBe(model!.id);

    component.closeModel();
    expect(component.selectedModel).toBeNull();
    expect(component.selectedMediaIndex).toBeNull();
  });
});
