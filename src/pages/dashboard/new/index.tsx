import { z } from "zod";
import { Container } from "../../../components/container";
import { DashboardHeader } from "../../../components/panelHeader";
import { FiTrash, FiUpload } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../../../components/input";
import { ChangeEvent, useContext, useState } from "react";
import { AuthContext } from "../../../contexts/authContext";
import { v4 as uuidV4 } from 'uuid';
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../../../services/firebaseConnection";
import { addDoc, collection } from "firebase/firestore";
import toast from "react-hot-toast";

const schema = z.object({
  name: z.string().nonempty("O campo nome é obrigatorio"),
  model: z.string().nonempty("O campo modelo é obrigatorio"),
  year: z.string().nonempty("O campo ano é obrigatorio"),
  km: z.string().nonempty("O campo km é obrigatorio"),
  price: z.string().nonempty("O campo preço é obrigatorio"),
  city: z.string().nonempty("O campo cidade é obrigatorio"),
  whatsapp: z.string().min(1, "O campo whatsapp é obrigatorio").refine((value) => /^(\d{10,12})$/.test(value), {
    message: "Numero de telefone invalido"
  }),
  description: z.string().nonempty("O campo descricão é obrigatorio"),
})

type FormData = z.infer<typeof schema>

interface ImageItemProps {
  uid: string;
  name: string;
  previewUrl: string;
  url: string;
}

export function New() {
  const { user } = useContext(AuthContext);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange'
  })

  const [carImages, setCarImages] = useState<ImageItemProps[]>([]);

  function onSubmit(data: FormData) {
    if(carImages.length === 0) {
      toast.error("Envie pelo menos uma imagem do veículo");
      return;
    }

    const carListImages = carImages.map((image) => {
      return {
        name: image.name,
        url: image.url,
        uid: image.uid
      }
    })

    addDoc(collection(db, "cars"), {
      name: data.name.toUpperCase(),
      model: data.model,
      year: data.year,
      km: data.km,
      price: data.price,
      city: data.city,
      whatsapp: data.whatsapp,
      description: data.description,
      created: new Date(),
      owner: user?.name,
      uid: user?.uid,
      images: carListImages
    })
    .then(() => {
      reset();
      setCarImages([]);
      toast.success("Anuncio criado com sucesso");
    })
    .catch(err => {
      console.log(err)
      toast.error("Erro ao criar anuncio");
    })
  }

  async function handleFile(e: ChangeEvent<HTMLInputElement>){
    if(e.target.files && e.target.files[0]){
      const image = e.target.files[0];

      if(image.type === 'image/jpeg' || image.type === 'image/png'){
        await handleUpload(image);
      } else {
        alert('Envie uma imagem do tipo PNG ou JPG');
        return
      }
    }
  }

  async function handleUpload(image: File) {
    if(!user?.uid) {
      alert('Necessario estar logado para fazer upload');
      return;
    }

    const currentId = user?.uid;
    const uidImage = uuidV4();

    const uploadRef = ref(storage, `images/${currentId}/${uidImage}`);

    uploadBytes(uploadRef, image)
    .then((snapshot) => {
      getDownloadURL(snapshot.ref).then((downloadUrl) => {
        const imageItem = {
          uid: currentId,
          name: uidImage,
          previewUrl: URL.createObjectURL(image),
          url: downloadUrl
        }

        setCarImages((images) => [...images, imageItem]);
        toast.success("Imagem enviada com sucesso");
      });
    })
  }

  async function handleDeleteImage(image: ImageItemProps) {
    const imagePath = `images/${image.uid}/${image.name}`;

    const imageRef = ref(storage, imagePath);

    try{
      await deleteObject(imageRef);
      setCarImages(carImages.filter((car) => car.url !== image.url));
    }catch(err){
      console.log(err)
    }
  }

  return (
    <Container>
      <DashboardHeader />

      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2">
        <button className="border-2 ww-48 rounded-lg flex items-center justify-center cursor-pointer border-gray-600 h-32 md:w-48">
          <div className="absolute cursor-pointer">
            <FiUpload size={30} color="#000" />
          </div>
          <div className="cursor-pointer">
            <input className="opacity-0 cursor-pointer" type="file" accept="image/*" onChange={handleFile} />
          </div>
        </button>

        {carImages.map( item => (
          <div className="w-fullh-32 flex items-center justify-center relative" key={item.name}>
            <button className="absolute" onClick={() => handleDeleteImage(item)}>
              <FiTrash size={28} color="#fff" />
            </button>
            <img src={item.previewUrl} alt="Carro" className="rounded-lg w-full h-32 object-cover" />
          </div>
        ))}
      </div>

      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2 mt-2">
        <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <p className="mb-2 font-medium">Nome do Carro</p>
            <Input
              type="text"
              register={register}
              name="name"
              error={errors.name?.message}
              placeholder="Ex: Onix 1.0"
            />
          </div>

          <div className="mb-3">
            <p className="mb-2 font-medium">Modelo do carro</p>
            <Input
              type="text"
              register={register}
              name="model"
              error={errors.model?.message}
              placeholder="Ex: 1.0 Flex PLUS MANUAL"
            />
          </div>

          <div className="flex w-full mb-3 gap-4 flex-row items-center">
            <div className="w-full">
              <p className="mb-2 font-medium">Ano</p>
              <Input
                type="text"
                register={register}
                name="year"
                error={errors.year?.message}
                placeholder="Ex: 2015/2016"
              />
            </div>

            <div className="w-full">
              <p className="mb-2 font-medium">KM rodados</p>
              <Input 
                type="text"
                register={register}
                name="km"
                error={errors.km?.message}
                placeholder="Ex: 23.900"
              />
            </div>
          </div>

          <div className="flex w-full mb-3 gap-4 flex-row items-center">
            <div className="w-full">
              <p className="mb-2 font-medium">Telefone / Whatsapp para contato</p>
              <Input
                type="text"
                register={register}
                name="whatsapp"
                error={errors.whatsapp?.message}
                placeholder="Ex: 1199101923"
              />
            </div>

            <div className="w-full">
              <p className="mb-2 font-medium">Cidade</p>
              <Input 
                type="text"
                register={register}
                name="city"
                error={errors.city?.message}
                placeholder="Ex: Coroatá"
              />
            </div>
          </div>

          <div className="mb-3">
            <p className="mb-2 font-medium">Preço</p>
            <Input
              type="text"
              register={register}
              name="price"
              error={errors.price?.message}
              placeholder="Ex: 69.000"
            />
          </div>

          <div className="mb-3">
            <p className="mb-2 font-medium">Descrição</p>
            <textarea
              className="border-2 w-full rounded-md h-24 px-2"
              {...register("description")}
              name="description"
              id="description"
              placeholder="Descricão do carro"
            />
            {errors.description && <p className="text-red-500 mb-1">{errors.description.message}</p>}
          </div>

          <button type="submit" className="rounded-md bg-zinc-900 text-white font-medium w-full h-10">
            Cadastrar
          </button>

        </form>
      </div>
    </Container>
  )
}