import { useEffect, useState } from "react";
import { Container } from "../../components/container";
import { db } from "../../services/firebaseConnection";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { Link } from "react-router-dom";

interface CarsProps {
  id: string;
  uid: string;
  name: string;
  model: string;
  year: string;
  km: string;
  price: string | number;
  city: string;
  images: CarImageProps[];
}

interface CarImageProps {
  uid: string;
  name: string;
  url: string;
}

export function Home() {
  const [cars, setCars] = useState<CarsProps[]>([]);
  const [loadImages, setLoadImages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    loadCars()
  }, [])

  function loadCars() {
    const carsRef = collection(db, "cars");
    const queryRef = query(carsRef, orderBy("created", "desc"));

    getDocs(queryRef)
      .then((snapshot) => {
        let listcars = [] as CarsProps[];

        snapshot.forEach((doc) => {
          listcars.push({
            id: doc.id,
            uid: doc.data().uid,
            name: doc.data().name,
            model: doc.data().model,
            year: doc.data().year,
            km: doc.data().km,
            price: doc.data().price,
            city: doc.data().city,
            images: doc.data().images
          })
        })

        setCars(listcars)
      })
  }

  function handleImageLoad(id: string) {
    setLoadImages((prevState) => [...prevState, id]);
  }

  async function handleSearchCar() {
    if (input === "") {
      loadCars();
      return;
    }

    setCars([]);
    setLoadImages([]);

    const q = query(collection(db, "cars"), 
    where("name", ">=", input.toUpperCase()),
    where("name", "<=", input.toUpperCase() + "\uf8ff")
    );

    const querySnapshot = await getDocs(q);

    let listcars = [] as CarsProps[];

    querySnapshot.forEach((doc) => {
      listcars.push({
        id: doc.id,
        uid: doc.data().uid,
        name: doc.data().name,
        model: doc.data().model,
        year: doc.data().year,
        km: doc.data().km,
        price: doc.data().price,
        city: doc.data().city,
        images: doc.data().images
      })
    })

    setCars(listcars);
  }


  return (
    <Container>
      <section className="bg-white p-4 rounded-lg w-full max-w-3xl mx-auto flex justify-center items-center gap-2">
        <input
          placeholder="Digite o nome do carro"
          className="w-full border-2 rounded-lg h-9 px-3 outline-none"
          onChange={(e) => setInput(e.target.value)}
          value={input}
        />
        <button onClick={handleSearchCar} className="bg-red-500 h-9 px-8 rounded-lg text-white font-medium text-lg">
          Buscar
        </button>
      </section>

      <h1 className="font-bold text-center mt-6 text-2xl mb-4">Carros novos e usados em todo o Brasil</h1>

      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

        {cars.map(car => (
          <Link to={`/car/${car.id}`} key={car.id}>
            <section className="w-full bg-white rounded-lg">
              <div style={{ display: loadImages.includes(car.id) ? 'none' : 'block'}} className="w-full h-72 rounded-lg bg-slate-200"></div>
              <img style={{ display: loadImages.includes(car.id) ? 'block' : 'none'}} onLoad={() => handleImageLoad(car.id)} className="w-full rounded-lg mb-2 max-h-72 hover:scale-105 transition-all" src={car.images[0].url} alt="Carro" />
              <p className="font-bold mt-1 mb-2 px-2">{car.name}</p>
              <div className="flex flex-col px-2">
                <span className="text-zinc-700 mb-6">Ano {car.year} | {car.km} km</span>
                <strong className="text-black font-medium text-xl">R$ {car.price}</strong>
              </div>

              <div className="w-full h-px bg-slate-200 my-2"></div>

              <div className="px-2 pb-2">
                <span className="text-zinc-700">
                  {car.city}
                </span>
              </div>
            </section>
          </Link>
        ))}

      </main>

    </Container>
  )
}