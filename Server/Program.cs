using GrpcGreeter.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddGrpc();

builder.Services.AddCors(o => o.AddPolicy("AllowAll", builder =>
{
    builder.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader()
            .WithExposedHeaders("Grpc-Status", "Grpc-Message", 
                "Grpc-Encoding", "Grpc-Accept-Encoding", 
                "Grpc-Status-Details-Bin");
}));

var app = builder.Build();

app.UseGrpcWeb();
app.UseCors();

app.MapGrpcService<GreeterService>().EnableGrpcWeb()
                                    .RequireCors("AllowAll");

app.MapGet("/", () => "This gRPC service is gRPC-Web enabled, CORS " +
    "enabled, and is callable from browser apps using the gRPC-Web " +
    "protocol");

app.Run();