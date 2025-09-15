describe("DApp Wallet Connect", () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/');
    });

    it("connects wallet", () => {
        cy.get(".connect-button").click();
        cy.get("#accountAddress").should("contain", "0x1234");
    });
});
