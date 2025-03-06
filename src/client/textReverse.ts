const substitutionPattern = {};
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
for (let i = 0; i < alphabet.length; i++) {
   substitutionPattern[alphabet[i]] = alphabet[(i + 1) % alphabet.length];
   substitutionPattern[alphabet[i].toLowerCase()] = alphabet[(i + 1) % alphabet.length].toLowerCase();
}

let speacialCharters = '?.,!@#$%^&*()_+-=[]{}|;:<>/';
for (let i = 0; i < speacialCharters.length; i++) {
   substitutionPattern[speacialCharters[i]] = speacialCharters[i];
}

const encrypt = (text: string) => text.split('').map((char) => substitutionPattern[char] || char).join('')
const decrypt = (text: string) => {
   return text.split('').map((char) => {
      for (let key in substitutionPattern) {
         if (substitutionPattern[key] === char) {
            return key;
         }
      }
      return char;
   }).join('');
}

export default {
   encrypt,
   decrypt
}