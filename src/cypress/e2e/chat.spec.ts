describe("Chat App", () => {
  beforeEach(() => {
    cy.visit("/")
    cy.wait(1000)
  })

  it("loads the chat UI", () => {
    cy.get("textarea", { timeout: 10000 }).should("be.visible")
    cy.contains("Send").should("be.visible")
  })

  it("sends a message and gets a response", () => {
    cy.get("textarea", { timeout: 10000 }).type("Hello AI!")
    cy.contains("Send").click()

    cy.get(".me .message-text").should("contain", "Hello AI!")
    cy.get(".ai .message", { timeout: 10000 }).should("exist")
  })

  it("starts a new session", () => {
    cy.get("textarea", { timeout: 10000 }).type("Hello!")
    cy.contains("Send").click()
    cy.get(".me .message-text").should("contain", "Hello!")

    cy.contains("Start new session").click()
    cy.get(".message").should("not.exist")
  })
})
