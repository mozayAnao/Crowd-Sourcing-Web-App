        const phoneInputField = document.querySelector("#phone");
        const phoneInput = window.intlTelInput(phoneInputField, {
          initialCountry: "auto",
          geoIpLookup: getIp,
          utilsScript:
            "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
        });

        function getIp(callback) {
        fetch('https://ipinfo.io/json?token=2997d36693a5ef', { headers: { 'Accept': 'application/json' }})
            .then((resp) => resp.json())
            .catch(() => {
            return {
                country: 'us',
            };
            })
            .then((resp) => callback(resp.country));
        }

        const phone = document.querySelector("#phone");   
        const phoneCode = document.querySelector("#phoneCode"); 

        phone.addEventListener('input', updateValue);

        function updateValue(e) {
            const phoneNumber = phoneInput.getNumber();
            // info.style.display = "";
            phoneCode.value = `${phoneNumber}`;
        }    

        $(document).ready(function () {
          $(".data-table").each(function (_, table) {
            $(table).DataTable();
          });
        });

   
        
   