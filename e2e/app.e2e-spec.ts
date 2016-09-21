import { Fireform3Page } from './app.po';

describe('fireform3 App', function() {
  let page: Fireform3Page;

  beforeEach(() => {
    page = new Fireform3Page();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
