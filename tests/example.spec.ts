import { expect } from 'chai';
import 'mocha';

function add(a?: number, b?: number) {
  if (!a || !b) return;
  return a + b;
}

describe('Example tests', () => {
  it('show examples', () => {
    expect(true).true;

    expect(add(1, 2)).equal(3);

    expect(add()).undefined;

    expect([]).empty;

    expect('').empty;

    const obj = {
      key: 'value',
    };
    expect(obj).to.be.an('object').to.have.property('key').to.equal('value');
  });
});
