import argon2 from "argon2";

// Carrega as variáveis de ambiente do .env
process.loadEnvFile();

const pepperBase64 = process.env.ARGON2_PEPPER;

if (!pepperBase64) {
  throw new Error("ERRO: ARGON2_PEPPER não encontrado no .env");
}

const pepperBuffer = Buffer.from(pepperBase64, "base64");

// -----------------------------------------------------------------------------
// Função 1: GERAR HASH
// Use os parâmetros exatos do User.model.ts
// -----------------------------------------------------------------------------
export async function hash(password: string): Promise<string> {
  const hashGerado = await argon2.hash(password, {
    type: argon2.argon2id,
    secret: pepperBuffer,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
  });

  console.log(`\n✅ Hash gerado para a senha "${password}":`);
  console.log(hashGerado);
  console.log("");

  return hashGerado;
}

// -----------------------------------------------------------------------------
// Função 2: VERIFICAR HASH
// Use os parâmetros exatos do login.service.ts
// -----------------------------------------------------------------------------
export async function verify(
  hashToVerify: string,
  passwordToVerify: string,
): Promise<boolean> {
  const isValid = await argon2.verify(hashToVerify, passwordToVerify, {
    secret: pepperBuffer,
  });

  if (isValid) {
    console.log(
      `\n✅ SUCESSO! A senha "${passwordToVerify}" confere com o hash informado.`,
    );
  } else {
    console.log(
      `\n❌ FALHA! A senha "${passwordToVerify}" *NÃO* confere com o hash.`,
    );
  }

  return isValid;
}

// =============================================================================
// ÁREA DE TESTE - Comente e descomente conforme o uso
// =============================================================================
async function test() {
  // Exemplo 1: Gerar Hash
  await hash("MinhaSenhaSegura123!");

  // Exemplo 2: Verificar Hash (cole o hash gerado da etapa anterior no primeiro parâmetro)
  /* await verify(
    "$argon2id$v=19$m=65536,t=3,p=1$j/1hrk7mlAcoEldeA+3TmQ$bERnUi1DjefHVPmgOto+bnQ40xLyn9gXeKAuNVdcgh4",
    "MinhaSenhaSegura123!",
  ); */
}

test().catch(console.error);
