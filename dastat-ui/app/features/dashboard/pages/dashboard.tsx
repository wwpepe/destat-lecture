import { supabase } from "~/postgres/supaclient";
//nevigation
//  1. dashborad
//  2. survey
//  3. profile
//  4. archive

//before rendering Home react component
export async function loader() {
  const { data } = await supabase().from("destat-test").select("*");
  console.log(data);
}
export default function Dashboard() {
  return <div>Hello, destat world!</div>;
}
