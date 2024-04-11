export abstract class Op {
    static depsoit = 0xf9471134;
    static withdraw = 0xcb03bfaf;
}

export abstract class Errors {
    static not_admin = 73;
    static withdraw_amount_too_little = 74;
    static withdraw_amount_too_large = 75;
    static wrong_op = 0xffff;
}
