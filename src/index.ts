
import { Config } from "./config";
import { Nave } from "./nave";

window.onload = () => { new Nave(new Config()); }; 
