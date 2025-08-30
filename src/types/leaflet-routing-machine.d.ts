declare module "leaflet-routing-machine" {
  import * as L from "leaflet";

  namespace Routing {
    function control(options: any): L.Control;
  }

  const Routing: typeof Routing;
  export = Routing;
}
