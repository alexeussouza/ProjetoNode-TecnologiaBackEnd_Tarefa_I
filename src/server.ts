import express, { type Request, type Response} from 'express';
import { describe } from 'node:test';
import { PrismaClient } from './generated/prisma/index';

// cria uma instancia da aplicação express
const app = express();

const prisma = new PrismaClient

//Define a porta em que o servidor vai rodar
// Usamos 3001 para não conflitar com frontend que usa 5173 ou 3000
const PORT = 3001;

app.use(express.json())

// define a rota inicial endpoint para o servidor
app.get('/', (req: Request, res: Response) => {
    res.json({message: 'status: ok'});
});

// endpoint para listar todos os produtos
app.get('/products', async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany()
    res.json(products)
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    res.status(404).json({ error: 'Erro ao buscar produtos no banco de dados.' })
  }
})

//Lista um produto por id
app.get('/products/:id', async (req: Request, res: Response) => {
  const productId = Number(req.params.id)

  if (isNaN(productId)) {
    return res.status(400).json({ error: 'ID inválido. Deve ser um número.' })
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado.' })
    }

    res.json(product)
  } catch (error) {
    console.error('Erro ao buscar produto por ID:', error)
    res.status(500).json({ error: 'Erro interno ao buscar produto.' })
  }
})

// 🟡 Adicionar um novo produto
app.post('/products', async (req: Request, res: Response) => {
  const { titulo, descricao, preco,  destaque } = req.body
  try {
    const newProduct = await prisma.product.create({
      data: { titulo, descricao, preco, destaque }
    })
    res.status(201).json(newProduct)
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar produto.' })
  }
})

// Atualizar um produto existente
app.put('/products/:id', async (req: Request, res: Response) => {
  const productId = Number(req.params.id)
  const { titulo, descricao, preco, destaque } = req.body
  try {
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { titulo, descricao, preco, destaque }
    })
    res.json(updatedProduct)
  } catch (error) {
    res.status(404).json({ error: 'Produto não encontrado ou erro na atualização.' })
  }
})

// Excluir um produto
app.delete('/products/:id', async (req: Request, res: Response) => {
  const productId = Number(req.params.id)
  try {
    await prisma.product.delete({ where: { id: productId } })
    res.json({ message: 'Produto excluído com sucesso.' })
  } catch (error) {
    res.status(404).json({ error: 'Produto não encontrado ou erro na exclusão.' })
  }
})

app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso em http://localhost:${PORT}`);
});
