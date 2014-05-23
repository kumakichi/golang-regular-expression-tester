package main

import (
	"code.google.com/p/go.net/websocket"
	"encoding/json"
	"html/template"
	"log"
	"net/http"
	"regexp"
)

type MatchResultResponse struct {
	Matches    [][]string `json:"matches"`
	GroupsName []string   `json:"groupsName"`
}

func handler(rw http.ResponseWriter, req *http.Request) {
	t, _ := template.ParseFiles("index.html")
	t.Execute(rw, nil)
}

func regExpProc(conn *websocket.Conn, kv map[string]interface{}) {
	var matches [][]string

	regexpString, _ := kv["regexp"].(string)
	testString, _ := kv["testString"].(string)
	findAllSubmatch, _ := kv["findAllSubmatch"].(bool)

	log.Printf("Regexp : %s", regexpString)
	log.Printf("Test string : %s", testString)
	log.Printf("Find all : %t", findAllSubmatch)

	m := &MatchResultResponse{}

	r, err := regexp.Compile(regexpString)
	if err != nil {
		log.Printf("Invalid RegExp : %s \n", regexpString)
		// rw.WriteHeader(500)
		// fmt.Fprintf(rw, "Invalid RegExp : %s", regexpString)
		return
	}

	if findAllSubmatch {
		matches = r.FindAllStringSubmatch(testString, -1)
	} else {
		matches = [][]string{r.FindStringSubmatch(testString)}
	}

	log.Println(matches)

	if len(matches) > 0 {
		m.Matches = matches
		m.GroupsName = r.SubexpNames()[1:]
	}

	b, _ := json.Marshal(m)
	websocket.Message.Send(conn, b)
}

func webSocketServer(w http.ResponseWriter, req *http.Request) {
	s := websocket.Server{Handler: websocket.Handler(webSocketHandler)}
	s.ServeHTTP(w, req)
}

func webSocketHandler(conn *websocket.Conn) {
	var in []byte
	var kv map[string]interface{}
	for {
		if err := websocket.Message.Receive(conn, &in); err != nil {
			return
		}
		json.Unmarshal(in, &kv)
		switch kv["msg_id"] {
		case "sync":
			log.Printf("init msg : %s\n", kv["msg_body"])
		case "reg_form":
			log.Println(kv)
			regExpProc(conn, kv)
		}
	}
}

func main() {
	// index.html
	http.HandleFunc("/", handler)
	// Static file serving
	http.Handle("/assets/", http.StripPrefix("/assets/", http.FileServer(http.Dir("assets"))))
	// websocket server
	http.HandleFunc("/regvalidate", webSocketServer)

	// Launch server
	port := "3000"
	log.Printf("Listen at :%s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}
