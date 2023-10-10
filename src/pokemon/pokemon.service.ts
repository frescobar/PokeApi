import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {

  constructor(
      @InjectModel(Pokemon.name)
     private readonly pokemonModel: Model<Pokemon>
     ){}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
    return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }

    
  }

  findAll() {
    const pokemon = this.pokemonModel.find();
    return pokemon
  }

 async findOne(term: string) {
  let pokemon = null;

  if (!isNaN(+term)) {
    // Try to find by number
    pokemon = await this.pokemonModel.findOne({ no: term });
  }

  if (!pokemon && isValidObjectId(term)) {
    // Try to find by ID
    pokemon = await this.pokemonModel.findById(term);
  }

  if (!pokemon) {
    // Try to find by name (assuming name is stored in lowercase)
    pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase() });
  }

  if (!pokemon) {
    // If no match is found, throw a NotFoundException
    throw new NotFoundException('Pokemon not found');
  }

  return pokemon;
}

 

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    try {
    const pokemon = await this.findOne(term);
    if(updatePokemonDto.name){
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();
    }
    await this.pokemonModel.updateOne(pokemon, updatePokemonDto, {new: true});

    return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
    
  }

  async remove(id: string) {
   
    const {deletedCount}= await this.pokemonModel.deleteOne({_id: id});
    
    if(deletedCount === 0){
      throw new NotFoundException('Pokemon not found');
    }
    
  
   
  }

  private handleExceptions(error: any){
    if(error.code === 11000){
      throw new BadRequestException(`Pokemon already exists ${JSON.stringify(error.keyValue)}`);
    }
    throw new InternalServerErrorException('Something went wrong - check server logs')
  }

}
