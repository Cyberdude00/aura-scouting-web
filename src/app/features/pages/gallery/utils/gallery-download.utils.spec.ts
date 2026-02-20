import { downloadMediaFile } from './gallery-download.utils';

describe('downloadMediaFile', () => {
  it('creates and clicks a temporary anchor to download media', async () => {
    const fetchSpy = spyOn(window as unknown as { fetch: () => Promise<Response> }, 'fetch').and.returnValue(
      Promise.resolve(new Response(new Blob(['abc'], { type: 'image/jpeg' }), { status: 200 })),
    );

    const appendSpy = spyOn(document.body, 'appendChild').and.callThrough();

    await downloadMediaFile('https://example.com/photo.jpg', 'sample-photo');

    expect(fetchSpy).toHaveBeenCalled();
    expect(appendSpy).toHaveBeenCalled();
  });
});
