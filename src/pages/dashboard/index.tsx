import { FiTrash2 } from "react-icons/fi";
import { Container } from "../../components/container";
import { DashboardHeader } from "../../components/panelHeader";
import { useContext, useEffect, useState } from "react";
import { collection, getDocs, where, query, deleteDoc, doc } from "firebase/firestore";
import { db, storage } from "../../services/firebaseConnection";
import { AuthContext } from "../../contexts/authContext";
import { deleteObject, ref } from "firebase/storage";

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

export function Dashboard() {
  const [cars, setCars] = useState<CarsProps[]>([]);
  const { user } = useContext(AuthContext)

  useEffect(() => {
    function loadCars() {
      if (!user?.uid) {
        return;
      }

      const carsRef = collection(db, "cars");
      const queryRef = query(carsRef, where("uid", "==", user.uid));

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

    loadCars()
  }, [user])

  async function handleDeleteCar(car: CarsProps) {
    const itemCar = car;

    const docRef = doc(db, "cars", itemCar.id)
    await deleteDoc(docRef);

    itemCar.images.map( async (image) => {
      const imagePath = `images/${car.uid}/${image.name}`
      const imageRef = ref(storage, imagePath)
      try{
        await deleteObject(imageRef);
        setCars(cars.filter(car => car.id !== itemCar.id))
      } catch(err){
        console.log(err)
      }
    })

  }

  return (
    <Container>
      <DashboardHeader />

      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cars.map((car) => (
          <section key={car.id} className="w-full bg-white rounded-lg relative">
            <button onClick={() => handleDeleteCar(car)} className="absolute bg-white w-14 h-14 rounded-full flex items-center justify-center right-2 top-2 drop-shadow">
              <FiTrash2 size={26} color="#000" />
            </button>
            <img className="w-full rounded-lg mb-2max-h-70" src={car.images[0].url} alt="" />
            <p className="font-bold mb-2 mt-1 px-2">{car.name}</p>

            <div className="flex flex-col px-2">
              <span className="text-zinc-700">
                Ano {car.year} | {car.km} km
              </span>
              <strong className="text-black font-bold mt-4">R$ {car.price}</strong>

              <div className="w-full h-px bg-slate-200 my-2"></div>

              <div className="px-2 pb-2">
                <span className="text-black">
                  {car.city}
                </span>
              </div>
            </div>
          </section>
        ))}
      </main>
    </Container>
  )
}