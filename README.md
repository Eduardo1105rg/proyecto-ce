# MarketByte

## Explicacion general del proyecto
El proyecto MarketByte es una aplicación Web que simula el funcionamiento de un E-Commerce. Cuenta con un catalogo de 500 productos para el hogar. Por otro lado cuenta con diversas opciones de busqueda para que los usuarios puedan encontrar los productos que deseen con gran facilidad.

## Desiciones de diseño
No se utilizadon tanto los componentes de Algolia, si no que se utilizaron los hooks que ofrece Algolia, esto ya que es mas facil crear nuestros propios componentes que modificar los que da por defecto algolia. 

## Experiencia de usuario
Los componentes de filtros y busqueda estan diseñados para facilitar la busqueda de productos. Ambos trabajan en conjunto para mostrar productos que coincidan con los criterios del usuario. Ademas, ambos componentes se actualizan dinamicamente, es decir, que los filtros disponibles se actualizan conforme los productos que queden, para que el usuario pueda delimitar mejor lo que desee. Para la barra se busqueda esta se ubica en la parte superior de la ventana y permite que el usuario acceda mas facilmente a ella, por el lado del del recuadro de filtros, este se ubica en la zona lateral izquierda de la pantalla, es, esto para que el usuario pueda acceder facilmente a ella, no tenga complicaciones encontrado y que no le estorbe cuando esta revisando los productos del catalogo. 
Por otro lado, el componeten de paginacion se encuentra en la zona inferior del catalogo, al final de los productos, esto para que cuando el usuario termine de visualizar la pagina actual, pueda pasar facilmente a la siguiente pagina. Esta parte de paginacion solo muestra 3 recuadros para navegar esto con el fin de que no sea molesto ver todas las paginas disponibles, por lo que solo se muestra el recuadro de la primera pagina, el recuadro de la segunda y el recuadro de la ultima pagina disponible.

## Manejo de estados
Cuando una busqueda mediante la barra de busqueda o filtros, no encuentre productos que coincidan, el programa no podra mostrar productos en pantalla. Por otro lado, la parte del recuadro de filtros, dejara deja de mostrar los filtros disponibles, esto debido a que los filtros disponibles se actualizan conforme los productos que queden, para que el usuario pueda delimitar mejor lo que desee, por lo tanto, cuando una busqueda  no arroje resultados, la interfaz quedara a como se muestra en la siguiente imagene.

![img](./Docs/images/IMG_Busqueda_Cero_Coincidencias.png)