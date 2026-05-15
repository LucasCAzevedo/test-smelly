const { UserService } = require('../src/userService');

const defaultUserData = {
  nome: 'Fulano de Tal',
  email: 'fulano@teste.com',
  idade: 25,
};

describe('UserService - Suíte de Testes Limpa', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  test('deve criar um usuário válido com todos os campos obrigatórios', () => {
    // Arrange
    const { nome, email, idade } = defaultUserData;

    // Act
    const usuario = userService.createUser(nome, email, idade);

    // Assert
    expect(usuario).toMatchObject({
      nome,
      email,
      idade,
      isAdmin: false,
      status: 'ativo',
    });
    expect(usuario.id).toBeDefined();
    expect(usuario.createdAt).toBeInstanceOf(Date);
  });

  test('deve lançar erro quando algum campo obrigatório estiver ausente', () => {
    expect(() => userService.createUser('', 'teste@teste.com', 25)).toThrow(
      'Nome, email e idade são obrigatórios.'
    );
    expect(() => userService.createUser('Fulano', '', 25)).toThrow(
      'Nome, email e idade são obrigatórios.'
    );
    expect(() => userService.createUser('Fulano', 'teste@teste.com')).toThrow(
      'Nome, email e idade são obrigatórios.'
    );
  });

  test('deve lançar erro ao tentar criar usuário menor de idade', () => {
    expect(() => userService.createUser('Menor', 'menor@teste.com', 17)).toThrow(
      'O usuário deve ser maior de idade.'
    );
  });

  test('deve retornar null ao buscar usuário inexistente', () => {
    const resultado = userService.getUserById('id-inexistente');

    expect(resultado).toBeNull();
  });

  test('deve desativar um usuário comum e manter administrador ativo', () => {
    // Arrange
    const usuarioComum = userService.createUser('Comum', 'comum@teste.com', 30);
    const usuarioAdmin = userService.createUser('Admin', 'admin@teste.com', 40, true);

    // Act
    const resultadoComum = userService.deactivateUser(usuarioComum.id);
    const resultadoAdmin = userService.deactivateUser(usuarioAdmin.id);

    // Assert
    expect(resultadoComum).toBe(true);
    expect(userService.getUserById(usuarioComum.id).status).toBe('inativo');
    expect(resultadoAdmin).toBe(false);
    expect(userService.getUserById(usuarioAdmin.id).status).toBe('ativo');
  });

  test('deve retornar false ao desativar usuário inexistente', () => {
    const resultado = userService.deactivateUser('usuario-nao-existe');

    expect(resultado).toBe(false);
  });

  test('deve gerar relatório de usuários quando houver usuários cadastrados', () => {
    // Arrange
    const usuario1 = userService.createUser('Alice', 'alice@email.com', 28);
    const usuario2 = userService.createUser('Bob', 'bob@email.com', 32);

    // Act
    const relatorio = userService.generateUserReport();
    const linhas = relatorio.split('\n').filter(Boolean);

    // Assert
    expect(linhas[0]).toBe('--- Relatório de Usuários ---');
    expect(linhas).toEqual(
      expect.arrayContaining([
        expect.stringContaining(usuario1.id),
        expect.stringContaining('Nome: Alice'),
        expect.stringContaining(usuario2.id),
        expect.stringContaining('Nome: Bob'),
      ])
    );
  });

  test('deve informar que não há usuários quando o banco estiver vazio', () => {
    // Act
    const relatorio = userService.generateUserReport();

    // Assert
    expect(relatorio).toContain('Nenhum usuário cadastrado.');
    expect(relatorio).toMatch(/^--- Relatório de Usuários ---/);
  });
});
