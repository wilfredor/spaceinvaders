//Check if a var exist
export class Tool {
    //A random number multiple of 5
    static randomRange(min: number, max: number) {
        return Math.round((Math.random() * (max - min) + min) / 5) * 5;
    }

}
