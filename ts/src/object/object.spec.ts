import { StringObj } from ".";

test("test string hash key", () => {
    const hello1 = new StringObj("Hello Wolrd");
    const hello2 = new StringObj("Hello Wolrd");
    const diff1 = new StringObj("My name is johnny");
    const diff2 = new StringObj("My name is johnny");

    expect(hello1.hashKey()).toEqual(hello2.hashKey());
    expect(diff1.hashKey()).toEqual(diff2.hashKey());
});
